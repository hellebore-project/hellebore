use sea_orm_migration::{prelude::*, schema::*};

use crate::init::language::Language;

const WORD_LANG_ID_FK_NAME: &str = "fk_word_lang_id";

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
                    .col(string(Word::Definition))
                    .col(json(Word::Translations))
                    .foreign_key(
                        ForeignKey::create()
                            .name(WORD_LANG_ID_FK_NAME)
                            .from(Word::Table, Word::LanguageId)
                            .to(Language::Table, Language::EntryId) // FIXME: the entry ID should be the foreign key
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_foreign_key(ForeignKey::drop().name(WORD_LANG_ID_FK_NAME).to_owned())
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
    Definition,
    Translations,
}
