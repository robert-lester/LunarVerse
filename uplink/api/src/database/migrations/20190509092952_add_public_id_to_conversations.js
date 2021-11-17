exports.up = knex => knex.schema.alterTable('conversations', table => table.uuid('public_id').unique().after('id'));

exports.down = knex => knex.schema.alterTable('conversations', table => table.dropColumn('public_id'));