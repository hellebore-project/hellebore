use sea_orm::*;

use ::entity::{word, word::Entity as Word};

use crate::types::{
    CodedEnum, GrammaticalGender, GrammaticalNumber, GrammaticalPerson, VerbForm, VerbTense,
    WordType,
};

use super::util;

pub async fn insert(
    db: &DbConn,
    language_id: i32,
    word_type: WordType,
    spelling: Option<String>,
    number: Option<GrammaticalNumber>,
    person: Option<GrammaticalPerson>,
    gender: Option<GrammaticalGender>,
    verb_form: Option<VerbForm>,
    verb_tense: Option<VerbTense>,
    translations: Option<serde_json::Value>,
) -> Result<word::Model, DbErr> {
    let translations = match translations {
        Some(t) => Set(t),
        None => NotSet,
    };
    let new_entity = word::ActiveModel {
        id: NotSet,
        language_id: Set(language_id),
        word_type: Set(word_type.code()),
        spelling: util::set_value_or_default(spelling),
        number: util::set_type_or_default(number),
        person: util::set_type_or_default(person),
        gender: util::set_type_or_default(gender),
        verb_form: util::set_type_or_default(verb_form),
        verb_tense: util::set_type_or_default(verb_tense),
        translations,
    };
    return new_entity.insert(db).await;
}

pub async fn update(
    db: &DbConn,
    id: i32,
    language_id: Option<i32>,
    word_type: Option<WordType>,
    spelling: Option<String>,
    number: Option<GrammaticalNumber>,
    person: Option<GrammaticalPerson>,
    gender: Option<GrammaticalGender>,
    verb_form: Option<VerbForm>,
    verb_tense: Option<VerbTense>,
    translations: Option<serde_json::Value>,
) -> Result<word::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Word not found.".to_owned()));
    };
    let translations = match translations {
        Some(t) => Set(t),
        None => NotSet,
    };
    let updated_entity = word::ActiveModel {
        id: Unchanged(existing_entity.id),
        language_id: util::set_value_or_null(language_id),
        word_type: util::set_type_or_null(word_type),
        spelling: util::set_value_or_null(spelling),
        number: util::set_type_or_null(number),
        person: util::set_type_or_null(person),
        gender: util::set_type_or_null(gender),
        verb_form: util::set_type_or_null(verb_form),
        verb_tense: util::set_type_or_null(verb_tense),
        translations,
    };
    updated_entity.update(db).await
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<word::Model>, DbErr> {
    Word::find_by_id(id).one(db).await
}

pub async fn get_all_for_language(
    db: &DbConn,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<word::Model>, DbErr> {
    let mut query = Word::find()
        .filter(word::Column::LanguageId.eq(language_id))
        .order_by_asc(word::Column::Spelling);
    if word_type.is_some() {
        query = query.filter(word::Column::WordType.eq(word_type.unwrap().code()));
    }
    query.all(db).await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Word not found.".to_owned()));
    };
    return existing_entity.delete(db).await;
}

pub async fn delete_all(db: &DbConn, language_id: i32) -> Result<DeleteResult, DbErr> {
    Word::delete_many()
        .filter(word::Column::LanguageId.eq(language_id))
        .exec(db)
        .await
}
