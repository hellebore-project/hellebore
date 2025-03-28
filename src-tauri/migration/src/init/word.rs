use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

const WORD_LANGUAGE_SPELLING_INDEX_NAME: &str = "index_word_language_id_spelling";

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
        manager
            .create_index(
                Index::create()
                    .name(WORD_LANGUAGE_SPELLING_INDEX_NAME)
                    .table(Word::Table)
                    .col(Word::LanguageId)
                    .col(Word::Spelling)
                    .unique()
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name(WORD_LANGUAGE_SPELLING_INDEX_NAME)
                    .to_owned(),
            )
            .await?;
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
