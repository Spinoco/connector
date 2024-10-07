/**
 * Abstraction over paged queries
 */
export interface PagedQuery<Q, P> {
  /** query to perform against the server **/
  query?: Q;
  /** Page data to send that allows to get next page. This shall be the context of PagingResult.next **/
  page?: P;
  /** number of records to return **/
  count: number;
}

export interface PagingResult<A> {
  /** received element from the query **/
  result: A[];
  /** if present, contains the paging data that have to be supplied to the server with the next PagedQuery **/
  next?: string;
}
