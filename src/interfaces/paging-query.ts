export interface PagedQuery<Q, P> {
  query?: Q;
  page?: P;
  count: number;
}

export interface PagingResult<A> {
  result: A[];
  next?: string;
}
