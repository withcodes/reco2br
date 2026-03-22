from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import date

class InvoiceRecord(BaseModel):
    id: int
    gstin: str
    vendor_name: str
    invoice_no: str
    invoice_no_raw: str
    invoice_date: str | date | None = None
    invoice_value: float = 0.0
    taxable_value: float = 0.0
    igst: float = 0.0
    cgst: float = 0.0
    sgst: float = 0.0
    rate: float = 0.0
    itc_availability: str = ""
    filing_period: str = ""
    source: str = ""
    raw_row_numbers: List[int] = Field(default_factory=list)
    split_rows_count: int = 1
    warnings: List[str] = Field(default_factory=list)

    # Output fields for frontend table
    status: str = ""
    category: str = ""
    prAmount: float = 0.0
    gstrAmount: float = 0.0

class ReconciliationSummary(BaseModel):
    books_raw_rows: int = 0
    books_unique_invoices: int = 0
    gstr2b_records: int = 0
    exact_match: int = 0
    matched_normalized: int = 0
    gstin_typo: int = 0
    near_match: int = 0
    value_mismatch: int = 0
    tax_mismatch: int = 0
    missing_in_books: int = 0
    missing_in_2b: int = 0
    prior_period_invoices: int = 0
    itc_at_risk: float = 0.0
    total_tax_saved: float = 0.0
    total_tax_matched: float = 0.0
    total_2b_itc: float = 0.0
    itc_leakage: float = 0.0

class ReconciliationResponse(BaseModel):
    status: str
    period: str
    processing_log: List[str] = Field(default_factory=list)
    summary: ReconciliationSummary
    matched: List[Any] = Field(default_factory=list)
    matched_normalized: List[Any] = Field(default_factory=list)
    gstin_typo_cases: List[Any] = Field(default_factory=list)
    near_match_cases: List[Any] = Field(default_factory=list)
    mismatched: List[Any] = Field(default_factory=list)
    missing_in_books: List[Any] = Field(default_factory=list)
    missing_in_2b: List[Any] = Field(default_factory=list)
    prior_period: List[Any] = Field(default_factory=list)
