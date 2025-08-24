export enum WordType {
    None = 0,
    RootWord = 1,
    Article = 11,
    Preposition = 12,
    Conjunction = 13,
    Pronoun = 21,
    Noun = 31,
    Adjective = 41,
    Adverb = 42,
    Verb = 51,
}

export enum GrammaticalNumber {
    None = 0,
    Singular = 1,
    Dual = 2,
    Trial = 3,
    Quadral = 4,
    Quintal = 5,
    Paucal = 11,
    GreaterPaucal = 12,
    Plural = 21,
    GreaterPlural = 22,
    GreatestPlural = 23,
}

export enum GrammaticalGender {
    None = 0,
    Neutral = 1,
    Masculine = 11,
    Feminine = 12,
}

export enum GrammaticalPerson {
    None = 0,
    First = 1,
    Second = 2,
    Third = 3,
}

export enum VerbForm {
    None = 0,
    Infinitive = 1,
    Finite = 2,
}

export enum VerbTense {
    None = 0,
    Present = 1,
    Past = 11,
    Future = 21,
}
