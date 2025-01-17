use serde::{Deserialize, Serialize};

use crate::types::{
    GrammaticalGender, GrammaticalNumber, GrammaticalPerson, VerbForm, VerbTense, WordType,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WordCreateSchema {
    pub language_id: i32,
    pub word_type: WordType,
    pub spelling: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WordUpdateSchema {
    pub id: i32,
    pub language_id: Option<i32>,
    pub word_type: Option<WordType>,
    pub spelling: Option<String>,
    pub number: Option<GrammaticalNumber>,
    pub person: Option<GrammaticalPerson>,
    pub gender: Option<GrammaticalGender>,
    pub verb_form: Option<VerbForm>,
    pub verb_tense: Option<VerbTense>,
    pub translations: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WordInfoSchema {
    pub id: i32,
    pub language_id: i32,
    pub word_type: WordType,
    pub spelling: String,
    pub translations: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WordResponseSchema {
    pub id: i32,
    pub language_id: i32,
    pub word_type: WordType,
    pub spelling: String,
    pub number: GrammaticalNumber,
    pub person: GrammaticalPerson,
    pub gender: GrammaticalGender,
    pub verb_form: VerbForm,
    pub verb_tense: VerbTense,
    pub translations: String,
}
