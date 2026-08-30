use sea_orm::{
    sea_query::{
        Alias, CommonTableExpression, Expr, JoinType, SelectStatement, UnionType, WithClause,
    },
    *,
};
use uuid::Uuid;

use ::entity::{
    entry::{Column as EntryColumn, Entity as EntryEntity},
    folder::{
        ActiveModel as FolderActiveModel, Column as FolderColumn, Entity as FolderEntity,
        Model as FolderModel,
    },
};

use crate::constants::ROOT_FOLDER_ID;
use crate::model::entity_node::EntityNode;
use crate::utils::sea_orm as utils;

pub async fn insert<C>(con: &C, parent_id: Uuid, name: &str) -> Result<FolderModel, DbErr>
where
    C: ConnectionTrait,
{
    let new_entity = FolderActiveModel {
        id: Set(Uuid::new_v4()),
        parent_id: Set(convert_root_folder_id_to_null(parent_id)),
        name: Set(name.to_string()),
    };
    match new_entity.insert(con).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update<C>(
    con: &C,
    id: Uuid,
    parent_id: Option<Uuid>,
    name: Option<String>,
) -> Result<FolderModel, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get(con, id).await? else {
        return Err(DbErr::RecordNotFound("Folder not found.".to_owned()));
    };
    let updated_entity = FolderActiveModel {
        id: Unchanged(existing_entity.id),
        parent_id: set_optional_folder_id(parent_id),
        name: utils::set_optional_value(name),
    };
    updated_entity.update(con).await
}

pub async fn exists<C>(con: &C, id: Uuid) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    Ok(get(con, id).await?.is_some())
}

pub async fn is_name_unique_at_location<C>(
    con: &C,
    parent_id: Uuid,
    name: &str,
) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    let mut query = FolderEntity::find().filter(FolderColumn::Name.eq(name));

    let parent_id = convert_root_folder_id_to_null(parent_id);
    if parent_id.is_none() {
        // in sqlite3, comparisons involving NULL always resolve to false,
        // so we need to explicitly check whether the value is NULL
        query = query.filter(FolderColumn::ParentId.is_null());
    } else {
        query = query.filter(FolderColumn::ParentId.eq(parent_id));
    }

    let colliding_siblings = query.all(con).await?;

    if colliding_siblings.is_empty() {
        return Ok(true);
    }

    if colliding_siblings.len() > 1 {
        // there should never be more than one collision;
        // if the DB has reached this state, then something has gone wrong
        // TODO: log an error
    }

    Ok(false)
}

pub async fn get<C>(con: &C, id: Uuid) -> Result<Option<FolderModel>, DbErr>
where
    C: ConnectionTrait,
{
    FolderEntity::find_by_id(id).one(con).await
}

pub async fn get_folder_contents<C>(con: &C, root_folder_id: Uuid) -> Result<Vec<EntityNode>, DbErr>
where
    C: ConnectionTrait,
{
    let subfolder_table = Alias::new("subfolders");

    let base_query = SelectStatement::new()
        .column((FolderEntity, FolderColumn::Id))
        .from(FolderEntity)
        .and_where(Expr::col(FolderColumn::Id).eq(root_folder_id))
        .to_owned();

    let recursive_query = SelectStatement::new()
        .column((FolderEntity, FolderColumn::Id))
        .from(FolderEntity)
        .join(
            JoinType::InnerJoin,
            subfolder_table.clone(),
            Expr::col((FolderEntity, FolderColumn::ParentId))
                .equals((subfolder_table.clone(), FolderColumn::Id)),
        )
        .to_owned();

    let cte = CommonTableExpression::new()
        .query(
            base_query
                .clone()
                .union(UnionType::All, recursive_query)
                .to_owned(),
        )
        .column(FolderColumn::Id)
        .table_name(subfolder_table.clone())
        .to_owned();

    let select_subfolders = SelectStatement::new()
        .expr_as(Expr::col((subfolder_table.clone(), FolderColumn::Id)), "id")
        .expr_as(Expr::val("folder"), "node_type")
        .from(subfolder_table.clone())
        .to_owned();

    let subfolder_subquery = SelectStatement::new()
        .column(FolderColumn::Id)
        .from(subfolder_table.clone())
        .to_owned();

    let select_entries = SelectStatement::new()
        .expr_as(Expr::col((EntryEntity, EntryColumn::Id)), "id")
        .expr_as(Expr::val("entry"), "node_type")
        .from(EntryEntity)
        .and_where(
            Expr::col((EntryEntity, EntryColumn::FolderId))
                .in_subquery(subfolder_subquery)
                .and(Expr::col((EntryEntity, EntryColumn::FolderId)).is_not_null()),
        )
        .to_owned();

    let select = select_subfolders
        .clone()
        .union(UnionType::All, select_entries)
        .to_owned();

    let with_clause = WithClause::new().recursive(true).cte(cte).to_owned();

    let query = select.with(with_clause).to_owned();

    let stmt = con.get_database_backend().build(&query);

    EntityNode::find_by_statement(stmt).all(con).await
}

pub fn query(parent_id: Option<Uuid>, name: Option<String>) -> Select<FolderEntity> {
    let mut query = FolderEntity::find();

    if let Some(parent_id_value) = parent_id {
        let nullable_parent_id = convert_root_folder_id_to_null(parent_id_value);
        if nullable_parent_id.is_none() {
            query = query.filter(FolderColumn::ParentId.is_null());
        } else {
            query = query.filter(FolderColumn::ParentId.eq(parent_id_value));
        }
    }
    if let Some(name_value) = name {
        query = query.filter(FolderColumn::Name.eq(name_value));
    }

    query
}

pub async fn get_all<C>(con: &C) -> Result<Vec<FolderModel>, DbErr>
where
    C: ConnectionTrait,
{
    FolderEntity::find().all(con).await
}

pub async fn delete<C>(con: &C, id: Uuid) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    FolderEntity::delete_by_id(id).exec(con).await
}

pub async fn delete_many<C>(con: &C, ids: Vec<Uuid>) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    FolderEntity::delete_many()
        .filter(FolderColumn::Id.is_in(ids))
        .exec(con)
        .await
}

/// Cleans root folder IDs to null.
/// The root folder ID is treated as a sentinel value that corresponds to
/// the root folder. In the DB, the root folder is denoted by NULL.
pub fn convert_root_folder_id_to_null(id: Uuid) -> Option<Uuid> {
    if id == ROOT_FOLDER_ID {
        None // root folder ID
    } else {
        Some(id) // ID of existing folder
    }
}

/// Cleans null folder IDs to the root folder ID.
pub fn convert_null_folder_id_to_root(id: Option<Uuid>) -> Uuid {
    if id.is_none() {
        return ROOT_FOLDER_ID;
    }
    id.unwrap()
}

/// Convert an optional folder ID API argument into a stateful database value.
/// If `id` is a positive integer, then it is set in the database as is.
/// If `id` is a negative integer, then `None` is set in the database.
/// If `id` is `None`, then the value is not set in the database.
pub fn set_optional_folder_id(id: Option<Uuid>) -> ActiveValue<Option<Uuid>> {
    match id {
        Some(id) => ActiveValue::Set(convert_root_folder_id_to_null(id)), // value is set in the DB
        None => ActiveValue::NotSet, // no value is set in the DB
    }
}
