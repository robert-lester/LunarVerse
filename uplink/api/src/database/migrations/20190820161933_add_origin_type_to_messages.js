exports.up = async (knex) => {
  await knex.schema.alterTable('messages', (table) => {
    table
      .enum('origin', ['WEB', 'PHONE'])
      .defaultTo('PHONE')
      .notNullable()
      .comment('The origin of the message.');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('messages', (table) => {
    table.dropColumn('origin');
  });
};
