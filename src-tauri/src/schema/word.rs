use serde::{Deserialize, Serialize};

use crate::{
    types::{
        GrammaticalGender, GrammaticalNumber, GrammaticalPerson, VerbForm, VerbTense, WordType,
    },
    utils::value_or_default,
};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct WordUpdateSchema {
    pub id: Option<i32>,
    pub language_id: Option<i32>,
    pub word_type: Option<WordType>,
    pub spelling: Option<String>,
    pub number: Option<GrammaticalNumber>,
    pub person: Option<GrammaticalPerson>,
    pub gender: Option<GrammaticalGender>,
    pub verb_form: Option<VerbForm>,
    pub verb_tense: Option<VerbTense>,
    pub translations: Option<Vec<String>>,
}

impl WordUpdateSchema {
    pub fn to_response(&self) -> WordResponseSchema {
        WordResponseSchema {
            id: value_or_default(self.id),
            language_id: value_or_default(self.language_id),
            word_type: value_or_default(self.word_type),
            spelling: value_or_default(self.spelling.clone()),
            translations: value_or_default(self.translations.clone()),
            number: value_or_default(self.number),
            person: value_or_default(self.person),
            gender: value_or_default(self.gender),
            verb_form: value_or_default(self.verb_form),
            verb_tense: value_or_default(self.verb_tense),
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
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
    pub translations: Vec<String>,
}
