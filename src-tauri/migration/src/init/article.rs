use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

const ARTICLE_TITLE_INDEX_NAME: &str = "article_title_index";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Article::Table)
                    .if_not_exists()
                    .col(pk_auto(Article::Id).not_null())
                    .col(integer(Article::FolderId))
                    .col(tiny_unsigned(Article::EntityType).not_null())
                    .col(string_uniq(Article::Title).not_null())
                    .col(string(Article::Body))
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name(ARTICLE_TITLE_INDEX_NAME)
                    .table(Article::Table)
                    .col(Article::Title)
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Article::Table).to_owned())
            .await?;
        manager
            .drop_index(Index::drop().name(ARTICLE_TITLE_INDEX_NAME).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
pub enum Article {
    Table,
    Id,
    FolderId,
    #[sea_orm(rs_type = "u8")]
    EntityType,
    Title,
    Body,
}
