use sea_orm::FromQueryResult;

#[derive(Debug, FromQueryResult)]
pub struct EntityNode {
    pub id: uuid::Uuid,
    pub node_type: String,
}
