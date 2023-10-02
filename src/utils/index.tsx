import axios, { AxiosRequestConfig } from "axios"
const api = axios.create({
  baseURL: "https://safe-service.dev.bnb.zebec.io/api/v1/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8"
  }
})


export const getSafes = async (ownerAddress: string, chainId = 5) => {
    const { data } = await  api.get(`/owners/${ownerAddress}/safes`)
    return data;    
}

const relativeFirstCharacters = ['.', '/']

export const isRelativeUrl = (url: string): boolean => {
    return relativeFirstCharacters.indexOf(url[0]) > -1
  }
export const trimTrailingSlash = (url: string): string => {
    return url.replace(/\/$/, '')
  }
  
  export const isSameUrl = (url1: string, url2: string): boolean => {
    return trimTrailingSlash(url1) === trimTrailingSlash(url2)
  }