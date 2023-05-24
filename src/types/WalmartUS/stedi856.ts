import { type } from "os";

export interface WalmartAdvanceShipNotice {
  heading: Heading;
  detail: Detail;
  summary: Summary;
}

export interface Detail {
  hierarchical_level_HL_loop: DetailHierarchicalLevelHLLoop[];
}

export interface DetailHierarchicalLevelHLLoop {
  carrier_details_quantity_and_weight_TD1: CarrierDetailsQuantityAndWeightTD1[];
  carrier_details_routing_sequence_transit_time_TD5: CarrierDetailsRoutingSequenceTransitTimeTD5[];
  reference_information_REF: ReferenceInformationREF[];
  date_time_reference_DTM: DateTimeReferenceDTM[];
  fob_related_instructions_FOB: FobRelatedInstructionsFOB;
  party_identification_N1_loop: PartyIdentificationN1Loop[];
  hierarchical_level_HL_loop: HierarchicalLevelHLLoop[];
}

export interface CarrierDetailsQuantityAndWeightTD1 {
  weight_qualifier_06: string;
  weight_07: number;
  unit_or_basis_for_measurement_code_08: string;
}

export interface CarrierDetailsRoutingSequenceTransitTimeTD5 {
  identification_code_qualifier_02: string;
  identification_code_03: string;
  transportation_method_type_code_04: string;
}

export interface DateTimeReferenceDTM {
  date_time_qualifier_01: string;
  date_02: string;
}

export interface FobRelatedInstructionsFOB {
  shipment_method_of_payment_01: string;
}

export interface HierarchicalLevelHLLoop {
  purchase_order_reference_PRF: PurchaseOrderReferencePRF;
  reference_information_REF: ReferenceInformationREF[];
  hierarchical_level_HL_loop_tare?: HierarchicalLevelHLLoopTare[];
  hierarchical_level_HL_loop_pack?: HierarchicalLevelHLLoopPack[];
}

export interface HierarchicalLevelHLLoopTare {
  marking_packaging_loading_PKG: MarkingPackagingLoadingPKG[];
  marks_and_numbers_information_MAN: MarksAndNumbersInformationMAN[];
  pallet_type_and_load_characteristics_PAL: PalletTypeAndLoadCharacteristicsPAL;
  hierarchical_level_HL_loop: HierarchicalLevelHLLoopPack[];
}

export interface HierarchicalLevelHLLoopPack {
  marks_and_numbers_information_MAN: MarksAndNumbersInformationMAN[];
  hierarchical_level_HL_loop: HierarchicalLevelHLLoopItem[];
}

export interface HierarchicalLevelHLLoopItem {
  item_identification_LIN: ItemIdentificationLIN;
  item_detail_shipment_SN1: ItemDetailShipmentSN1;
}

export interface ItemDetailShipmentSN1 {
  number_of_units_shipped_02: string;
  unit_or_basis_for_measurement_code_03: string;
}

export interface ItemIdentificationLIN {
  product_service_id_qualifier_02: string;
  product_service_id_03: string;
  product_service_id_qualifier_04: string;
  product_service_id_05: string;
  product_service_id_qualifier_06: string;
  product_service_id_07: string;
}

export interface MarksAndNumbersInformationMAN {
  marks_and_numbers_qualifier_01: string;
  marks_and_numbers_02: string;
}

export interface MarkingPackagingLoadingPKG {
  item_description_type_01: string;
  packaging_characteristic_code_02: string;
  agency_qualifier_code_03: string;
  packaging_description_code_04: string;
}

export interface PalletTypeAndLoadCharacteristicsPAL {
  pallet_tiers_02: string;
  pallet_blocks_03: string;
}

export interface PurchaseOrderReferencePRF {
  purchase_order_number_01: string;
  date_04: string;
}

export interface ReferenceInformationREF {
  reference_identification_qualifier_01: string;
  reference_identification_02: string;
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
  identification_code_qualifier_03: string;
  identification_code_04: string;
}

export interface PartyLocationN3 {
  address_information_01: string;
  address_information_02?: string;
}

export interface Heading {
  transaction_set_header_ST: TransactionSetHeaderST;
  beginning_segment_for_ship_notice_BSN: BeginningSegmentForShipNoticeBSN;
}

export interface BeginningSegmentForShipNoticeBSN {
  transaction_set_purpose_code_01: string;
  shipment_identification_02: string;
  date_03: string;
  time_04: string;
  hierarchical_structure_code_05: string;
}

export interface TransactionSetHeaderST {
  transaction_set_identifier_code_01: string;
  transaction_set_control_number_02: number;
}

export interface Summary {
  transaction_totals_CTT: TransactionTotalsCTT;
  transaction_set_trailer_SE?: TransactionSetTrailerSE;
}

export interface TransactionSetTrailerSE {
  number_of_included_segments_01: number;
  transaction_set_control_number_02: number;
}

export interface TransactionTotalsCTT {
  number_of_line_items_01: number;
}
