/* import { AFFILIATE_REQUEST,AFFILIATE_SUCCESS,AFFILIATE_FAIL ,AFFILIATE_LINK_REQUEST, 
    AFFILIATE_LINK_SUCCESS, AFFILIATE_LINK_FAIL ,
    AFFILIATE_PRODUCTS_FAIL,AFFILIATE_PRODUCTS_REQUEST,AFFILIATE_PRODUCTS_SUCCESS } from "./affiliateConstants";
import axios from "axios";
import qs from 'qs';


// Requesting affiliate product
export const affiliateAction=(affiliateData)=>async (dispatch)=>{
    try {
        
        dispatch({type:AFFILIATE_REQUEST})

        const config = {
            headers: { 'Content-Type': 'application/json' } // Use JSON content type
        };
        const {data}=await axios.post("https://backend.cnkav.com/product_request/create",JSON.stringify(affiliateData),config);
        dispatch({type:AFFILIATE_SUCCESS,payload:data})
    } catch (error) {
        dispatch({ type: AFFILIATE_FAIL, payload: error.response.data.detail });
    }
}


export const generateAffiliateLinkAction=(affiliateLinkData)=>async (dispatch) =>{

    try {
       
        dispatch({type:AFFILIATE_LINK_REQUEST})
        const config = {
            headers: { 'Content-Type': 'application/json' } // Use JSON content type
        };
        const {data}=await axios.post("https://backend.cnkav.com/affiliate/generate-link",JSON.stringify(affiliateLinkData),config);

        dispatch({type:AFFILIATE_LINK_SUCCESS,payload:data})
    } catch (error) {
        dispatch({ type: AFFILIATE_LINK_FAIL, payload: error.response.data.detail });
    }
  
}


export const getAffiliateProductsAction=()=>async (dispatch) =>{
    try {
        dispatch({type:AFFILIATE_PRODUCTS_REQUEST})
        const config = {
            headers: { 'Content-Type': 'application/json' } // Use JSON content type
        };
        const {data}=await axios.get("https://backend.capitalkv.com/affiliate/all-products",config);
        
        dispatch({type:AFFILIATE_PRODUCTS_SUCCESS,payload:data})
    } catch (error) {
        dispatch({ type: AFFILIATE_PRODUCTS_FAIL, payload: error.response.data.detail });
    }
} */
