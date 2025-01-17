pub use sea_orm_migration::prelude::*;

mod init;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(init::project::Migration),
            Box::new(init::folder::Migration),
            Box::new(init::article::Migration),
            Box::new(init::language::Migration),
            Box::new(init::word::Migration),
            Box::new(init::person::Migration),
        ]
    }
}
