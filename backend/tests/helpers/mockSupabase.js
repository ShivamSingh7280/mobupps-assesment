// Mimics the chainable, thenable supabase-js query builder: every chain
// method returns the same builder, and the builder itself resolves to the
// pre-configured `result` whether the caller awaits it directly (e.g. after
// `.insert()`) or terminates the chain with `.single()` / `.maybeSingle()`.
function createQueryBuilder(result) {
  const builder = {};
  const chainMethods = ['select', 'insert', 'update', 'delete', 'eq', 'or', 'order', 'range', 'is', 'in', 'gt', 'gte', 'lte'];

  chainMethods.forEach((method) => {
    builder[method] = jest.fn(() => builder);
  });

  builder.maybeSingle = jest.fn(() => Promise.resolve(result));
  builder.single = jest.fn(() => Promise.resolve(result));
  builder.then = (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected);

  return builder;
}

module.exports = { createQueryBuilder };
