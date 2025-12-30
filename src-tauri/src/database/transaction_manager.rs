use sea_orm::{DatabaseConnection, DatabaseTransaction, TransactionTrait};

use crate::model::errors::api_error::ApiError;

/* NOTE
The sea-orm docs recommend creating a transaction inside a closure.
However, the syntax involves a lot of boiler-plate code, making it annoying to use.
It's not clear why a closure is preferred to using the begin/commit syntax,
but the latter is more intuitive to use.
*/

pub async fn begin(db: &DatabaseConnection) -> Result<DatabaseTransaction, ApiError> {
    db.begin()
        .await
        .map_err(|e| ApiError::db("Failed to create a new DB transaction", e))
}

pub async fn end(txn: DatabaseTransaction) -> Result<(), ApiError> {
    // NOTE: according to the docs, the transaction is automatically rolled back
    // if the transaction object goes out of scope
    txn.commit()
        .await
        .map_err(|e| ApiError::db("Failed to commit a DB transaction", e))
}
