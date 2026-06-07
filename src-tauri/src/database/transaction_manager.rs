use sea_orm::{DatabaseConnection, DatabaseTransaction, TransactionTrait};

use crate::model::errors::{Error, ErrorBuilder};

/* NOTE
The sea-orm docs recommend creating a transaction inside a closure.
However, the syntax involves a lot of boiler-plate code, making it annoying to use.
It's not clear why a closure is preferred to using the begin/commit syntax,
but the latter is more intuitive to use.
*/

pub async fn begin(db: &DatabaseConnection) -> Result<DatabaseTransaction, Error> {
    db.begin().await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to create a new DB transaction.")
            .from_err(e)
            .db()
            .transaction_failed()
    })
}

pub async fn end(txn: DatabaseTransaction) -> Result<(), Error> {
    // NOTE: according to the docs, the transaction is automatically rolled back
    // if the transaction object goes out of scope
    txn.commit().await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to commit a DB transaction.")
            .from_err(e)
            .db()
            .transaction_failed()
    })
}
