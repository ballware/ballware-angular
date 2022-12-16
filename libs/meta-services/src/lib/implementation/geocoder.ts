/**
 * External declaration of google api (needed to be included separatly)
 */
 declare let google: any;

 /**
  * Try to find coordinates for an address string
  * @param address Address used to find coordinates
  * @param success Callback executed when search has finished
  */
 export const geocodeAddress = (
   address: string,
   success: (location: { lat: number; lng: number }) => void
 ): void => {
   const geocoder = new google.maps.Geocoder();
 
   geocoder.geocode(
     {
       address: address,
     },
     (
       results: Array<{
         geometry: { location: { toJSON: () => { lat: number; lng: number } } };
       }>
     ) => {
       success(results[0].geometry.location.toJSON());
     }
   );
 };
 
 /**
  * Try to find address for coordinates
  * @param location Coordinates to find address for
  * @param success Callback executed when search has finished
  */
 export const geocodeLocation = (
   location: { lat: number; lng: number },
   success: (
     addresses: Array<{
       street?: string;
       houseNumber?: string;
       zipCode?: string;
       city?: string;
       country?: string;
     }>
   ) => void
 ): void => {
   const geocoder = new google.maps.Geocoder();
 
   geocoder.geocode(
     {
       location: location,
     },
     (
       results: Array<{
         address_components: {
           find: (
             predicate: (ac: { types: Array<string> }) => boolean
           ) => { long_name?: string };
         };
       }>
     ) => {
       if (results && results.length > 0) {
         success(
           results.map(r => {
             return {
               street: r.address_components.find(ac =>
                 ac.types.includes('route')
               )?.long_name,
               houseNumber: r.address_components.find(ac =>
                 ac.types.includes('street_number')
               )?.long_name,
               zipCode: r.address_components.find(ac =>
                 ac.types.includes('postal_code')
               )?.long_name,
               city: r.address_components.find(ac =>
                 ac.types.includes('locality')
               )?.long_name,
               country: r.address_components.find(ac =>
                 ac.types.includes('country')
               )?.long_name,
             };
           })
         );
       }
     }
   );
 };