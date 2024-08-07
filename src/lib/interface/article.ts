import { IdentifiedEntity, EntityType } from "./entities";

export interface Article<E extends IdentifiedEntity> {
    title: string;
    text: string;
    entityType: EntityType;
    entity: E | null;
}
