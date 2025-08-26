import { AFFILIATE_REQUEST,AFFILIATE_SUCCESS,AFFILIATE_FAIL,
    AFFILIATE_LINK_REQUEST, AFFILIATE_LINK_SUCCESS, AFFILIATE_LINK_FAIL,
    AFFILIATE_PRODUCTS_FAIL,AFFILIATE_PRODUCTS_REQUEST,AFFILIATE_PRODUCTS_SUCCESS } from "./affiliateConstants";


export const affiliateReducer=(state={affiliate:{}},action)=>{
    switch(action.type)
    {
        case AFFILIATE_REQUEST:
            return {
                isLoading:true,
            }
        case AFFILIATE_SUCCESS:
            return {
                ...state,
                isLoading:false,
                affiliate:action.payload,
            }
        case AFFILIATE_FAIL:
            return {
                ...state,
                isLoading:false,
                affiliate:null
            }
        default:
            return state;
    }
}

export const affiliateLinkReducer=(state={affiliateLink:{}},action)=>{
    switch(action.type)
    {
        case AFFILIATE_LINK_REQUEST:
            return {
                isLoading:true,
            }
        case AFFILIATE_LINK_SUCCESS:
            return {
                ...state,
                isLoading:false,
                affiliateLink:action.payload,
            }
        case AFFILIATE_LINK_FAIL:
            return {
                ...state,
                isLoading:false,
                affiliateLink:null
            }
        default:
            return state;
    }
}


export const getAffiliateProductsReducer=(state={allProducts:{}},action)=>{
    switch(action.type)
    {
        case AFFILIATE_PRODUCTS_REQUEST:
            return {
                isLoading:true,
            }
        case AFFILIATE_PRODUCTS_SUCCESS:
            return {
                ...state,
                isLoading:false,
                allProducts:action.payload
            }
        case AFFILIATE_PRODUCTS_FAIL:
            return{
                ...state,
                isLoading:false,
                allProducts:null
            }
          default:
            return state   
    }
}


