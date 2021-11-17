exports.up = knex => knex.schema.alterTable('messages', table => table.uuid('public_id').unique().after('id'));

exports.down = knex => knex.schema.alterTable('messages', table => table.dropColumn('public_id'));
