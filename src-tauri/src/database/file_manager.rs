// TODO: rename this file

use sea_orm::{
    sea_query::{
        Alias, CommonTableExpression, Expr, JoinType, SelectStatement, UnionType, WithClause,
    },
    *,
};
use uuid::Uuid;

use ::entity::entry::{Column as EntryColumn, Entity as EntryModel};
use ::entity::folder::{Column as FolderColumn, Entity as FolderModel};

use crate::constants::ROOT_FOLDER_ID;

#[derive(Debug, FromQueryResult)]
pub struct FileNode {
    pub id: uuid::Uuid,
    pub node_type: String,
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

pub async fn get_folder_contents<C>(con: &C, root_folder_id: Uuid) -> Result<Vec<FileNode>, DbErr>
where
    C: ConnectionTrait,
{
    let subfolder_table = Alias::new("subfolders");

    let base_query = SelectStatement::new()
        .column((FolderModel, FolderColumn::Id))
        .from(FolderModel)
        .and_where(Expr::col(FolderColumn::Id).eq(root_folder_id))
        .to_owned();

    let recursive_query = SelectStatement::new()
        .column((FolderModel, FolderColumn::Id))
        .from(FolderModel)
        .join(
            JoinType::InnerJoin,
            subfolder_table.clone(),
            Expr::col((FolderModel, FolderColumn::ParentId))
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
        .expr_as(Expr::col((EntryModel, EntryColumn::Id)), "id")
        .expr_as(Expr::val("entry"), "node_type")
        .from(EntryModel)
        .and_where(
            Expr::col((EntryModel, EntryColumn::FolderId))
                .in_subquery(subfolder_subquery)
                .and(Expr::col((EntryModel, EntryColumn::FolderId)).is_not_null()),
        )
        .to_owned();

    let select = select_subfolders
        .clone()
        .union(UnionType::All, select_entries)
        .to_owned();

    let with_clause = WithClause::new().recursive(true).cte(cte).to_owned();

    let query = select.with(with_clause).to_owned();

    let stmt = con.get_database_backend().build(&query);

    FileNode::find_by_statement(stmt).all(con).await
}
