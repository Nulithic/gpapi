export interface WalmartInvoice {
  heading: Heading;
  detail: Detail;
  summary: Summary;
}

export interface Detail {
  baseline_item_data_invoice_IT1_loop: BaselineItemDataInvoiceIT1Loop[];
}

export interface BaselineItemDataInvoiceIT1Loop {
  baseline_item_data_invoice_IT1: BaselineItemDataInvoiceIT1;
}

export interface BaselineItemDataInvoiceIT1 {
  quantity_invoiced_02: number;
  unit_or_basis_for_measurement_code_03: string;
  unit_price_04: number;
  product_service_id_qualifier_06: string;
  product_service_id_07: string;
  product_service_id_qualifier_08: string;
  product_service_id_09: string;
}

export interface Heading {
  transaction_set_header_ST: TransactionSetHeaderST;
  beginning_segment_for_invoice_BIG: BeginningSegmentForInvoiceBIG;
  reference_information_REF: ReferenceInformationREF[];
  party_identification_N1_loop: PartyIdentificationN1Loop[];
  terms_of_sale_deferred_terms_of_sale_ITD: TermsOfSaleDeferredTermsOfSaleITD[];
  date_time_reference_DTM: DateTimeReferenceDTM[];
  fob_related_instructions_FOB: FobRelatedInstructionsFOB;
}

export interface BeginningSegmentForInvoiceBIG {
  date_01: string;
  invoice_number_02: string;
  date_03: string;
  purchase_order_number_04: string;
}

export interface DateTimeReferenceDTM {
  date_time_qualifier_01: string;
  date_02: string;
}

export interface FobRelatedInstructionsFOB {
  shipment_method_of_payment_01: string;
}

export interface PartyIdentificationN1Loop {
  party_identification_N1: PartyIdentificationN1;
  party_location_N3?: PartyLocationN3[];
  geographic_location_N4?: GeographicLocationN4;
}

export interface GeographicLocationN4 {
  city_name_01: string;
  state_or_province_code_02: string;
  postal_code_03: string;
  country_code_04: string;
}

export interface PartyIdentificationN1 {
  entity_identifier_code_01: string;
  name_02: string;
  identification_code_qualifier_03?: string;
  identification_code_04?: string;
}

export interface PartyLocationN3 {
  address_information_01: string;
  address_information_02: string;
}

export interface ReferenceInformationREF {
  reference_identification_qualifier_01: string;
  reference_identification_02: string;
}

export interface TermsOfSaleDeferredTermsOfSaleITD {
  terms_type_code_01: string;
  terms_basis_date_code_02: string;
  terms_discount_percent_03: number;
  terms_discount_days_due_05: number;
  terms_net_days_07: number;
  terms_discount_amount_08: number;
  description_12: string;
}

export interface TransactionSetHeaderST {
  transaction_set_identifier_code_01: string;
  transaction_set_control_number_02: number;
}

export interface Summary {
  total_monetary_value_summary_TDS: TotalMonetaryValueSummaryTDS;
  tax_information_TXI?: TaxInformationTXI[];
  service_promotion_allowance_or_charge_information_SAC_loop: ServicePromotionAllowanceOrChargeInformationSACLoop[];
  invoice_shipment_summary_ISS_loop?: InvoiceShipmentSummaryISSLoop[];
  transaction_totals_CTT: TransactionTotalsCTT;
}

export interface TaxInformationTXI {
  tax_type_code_01: string;
  monetary_amount_02: number;
  percentage_as_decimal_03: number;
  tax_jurisdiction_code_qualifier_04?: string;
  tax_jurisdiction_code_05?: string;
  dollar_basis_for_percent_08?: number;
  tax_identification_number_09: string;
}

export interface ServicePromotionAllowanceOrChargeInformationSACLoop {
  service_promotion_allowance_or_charge_information_SAC: ServicePromotionAllowanceOrChargeInformationSAC;
}

export interface ServicePromotionAllowanceOrChargeInformationSAC {
  allowance_or_charge_indicator_01: string;
  service_promotion_allowance_or_charge_code_02: string;
  amount_05: number;
  allowance_or_charge_method_of_handling_code_12: string;
}

export interface InvoiceShipmentSummaryISSLoop {
  invoice_shipment_summary_ISS: InvoiceShipmentSummaryISS;
}

export interface InvoiceShipmentSummaryISS {
  number_of_units_shipped_01: number;
  unit_or_basis_for_measurement_code_02: string;
  weight_03?: number;
  unit_or_basis_for_measurement_code_04?: string;
}

export interface TotalMonetaryValueSummaryTDS {
  amount_01: number;
  amount_02: number;
  amount_03: number;
  amount_04: number;
}

export interface TransactionSetTrailerSE {
  number_of_included_segments_01: number;
  transaction_set_control_number_02: number;
}

export interface TransactionTotalsCTT {
  number_of_line_items_01: number;
}
