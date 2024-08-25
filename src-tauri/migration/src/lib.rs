pub use sea_orm_migration::prelude::*;

mod rev1;
mod rev0;
mod rev2;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(rev0::Migration),
            Box::new(rev1::Migration),
            Box::new(rev2::Migration),
        ]
    }
}
