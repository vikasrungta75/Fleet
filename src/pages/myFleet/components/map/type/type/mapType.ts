import { GoogleMapProps } from "@react-google-maps/api";

export type MapType = Parameters<NonNullable<GoogleMapProps['onLoad']>>[0];
