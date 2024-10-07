/**
 * Abstraction over paged queries
 */
export interface PagedQuery<Q, P> {
  /** Query to perform against the server **/
  query?: Q;
  /** page data to send that allows to get next page. This shall be context of PagingResult.next**/
  page?: P;
  /** number of record to return **/
  count: number;
}

export interface PagingResult<A> {
  /** received element from the query **/
  result: A[];
  /** if present contains paging data that have to be supplied to the server with next PagedQuery **/
  next?: string;
}
