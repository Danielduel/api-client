type HeaderLinkPagesT = {
  last: number | undefined;
  next: number | undefined;
  prev: number | undefined;
  first: number | undefined;
};
type RelPage = [string, number];

type PaginationT = Required<HeaderLinkPagesT> & {
  last: number;
  current: number;
  total: number | null;
};

export class Pagination {
  static get(response: Response): PaginationT | null {
    try {
      const pagination = new Pagination(response);
      return pagination.pagination();
    } catch (__) {
      return null;
    }
  }

  public last: number;
  public current: number;
  public total: number | null;

  private headerXTotalCount: number | null;
  private headerLinkArr: string[];
  private headerLinkPages: HeaderLinkPagesT;

  private constructor(public response: Response) {
    this.headerLinkArr = this.getHeaderLinkArr();
    this.headerXTotalCount = this.getHeaderXTotalCount();
    this.headerLinkPages = this.getHeaderLinkPages();

    this.last = Math.max(
      this.headerLinkPages.last || 0,
      (this.headerLinkPages.prev && this.headerLinkPages.prev + 1) || 0
    );

    this.current = this.headerLinkPages.next
      ? this.headerLinkPages.next - 1
      : this.headerLinkPages.last
        || 1;

    this.total = this.headerXTotalCount || null;
  }

  pagination(): PaginationT {
    return {
      total: this.total,
      current: this.current,
      last: this.last,
      
      next: this.headerLinkPages.next,
      prev: this.headerLinkPages.prev,
      first: this.headerLinkPages.first,
    };
  }
  
  getHeaderXTotalCount() {
    const total = this.response.headers.get("X-Total-Count");
    if (!total) return null;
    return parseInt(total, 10);
  }

  getHeaderLinkArr(): string[] {
    const link = this.response.headers.get("Link");
    if (!link) throw new Error("There is no Link header");
    return link.split(",");
  }

  *eachLinks(): Generator<RelPage> {
    for (const link of this.headerLinkArr) {
      const _link = link.replace(/(^\s*|\s*$)/, "");
      const [url, rel] = _link.split(";");

      if (!rel) continue;
      if (!url) continue;

      const urlMatch = url.match(/page=(\d+)/);

      if (!urlMatch) continue;

      const urlMatchDPart = urlMatch[1];

      if (!urlMatchDPart) continue;

      const page = parseInt(urlMatchDPart, 10);

      yield [rel, page] as RelPage;
    }
  }

  matchLast([rel, page]: RelPage): number | undefined {
    if (rel.match(/last/)) return page;
  }

  matchNext([rel, page]: RelPage): number | undefined {
    if (rel.match(/next/)) return page;
  }

  matchPrev([rel, page]: RelPage): number | undefined {
    if (rel.match(/prev/)) return page;
  }

  matchFirst([rel, page]: RelPage): number | undefined {
    if (rel.match(/first/)) return page;
  }

  getHeaderLinkPages(): HeaderLinkPagesT {
    const returns: HeaderLinkPagesT = {
      prev: void 0,
      first: void 0,
      next: void 0,
      last: void 0,
    };
    for (const relPage of this.eachLinks()) {
      returns.last ??= this.matchLast(relPage);      
      returns.next ??= this.matchNext(relPage);
      returns.prev ??= this.matchPrev(relPage);
      returns.first ??= this.matchFirst(relPage);
    }
    return returns;
  }
}

