use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Word::Table)
                    .if_not_exists()
                    .col(pk_auto(Word::Id).not_null())
                    .col(integer(Word::LanguageId))
                    .col(tiny_integer(Word::WordType))
                    .col(string(Word::Spelling))
                    .col(tiny_integer(Word::Number))
                    .col(tiny_integer(Word::Person))
                    .col(tiny_integer(Word::Gender))
                    .col(tiny_integer(Word::VerbForm))
                    .col(tiny_integer(Word::VerbTense))
                    .col(json(Word::Translations))
                    .to_owned(),
            )
            .await?;
        // TODO: add foreign key constraint to LanguageId
        // TODO: add cascade delete
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Word::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Word {
    Table,
    Id,
    LanguageId,
    WordType,
    Spelling,
    Number,
    Person,
    Gender,
    VerbForm,
    VerbTense,
    Translations,
}
