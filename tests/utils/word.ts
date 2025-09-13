import { WordType } from "@/domain/constants";

export function createWordData(wordType: WordType = WordType.Noun) {
    return {
        id: 1,
        language_id: 1,
        word_type: wordType,
        spelling: "test-word",
        definition: "tets-definition",
        translations: ["translation1"],
    };
}
