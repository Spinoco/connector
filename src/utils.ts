/**
  * A function that takes an array, an initial value, and a function that takes the accumulator and an element of the array and returns a new accumulator.
  * It returns the final accumulator after applying the function to each element of the array.
  */
function fold<A, R>(array: A[], initial: R, f: (acc: R, a: A) => R): R {
  let acc = initial;

  array.forEach((a) => {
    acc = f(acc, a);
  });

  return acc;
}

/**
  * A function that takes an array and a function that takes an element of the array and returns a promise.
  * It returns a promise that resolves when all promises returned by the function have resolved.
  */
export function foldPromise<A>(array: A[], f: (a: A) => Promise<void>): Promise<void> {
  return fold(array, Promise.resolve(), (acc, a) => acc.then(() => f(a)));
}

