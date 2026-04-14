import Listing from "../models/Listing.js"

export const getListings=async(req,res)=>{

const listings=await Listing.find()

res.json(listings)

}

export const createListing = async (req, res) => {

const listing=new Listing(req.body)

await listing.save()

res.json(listing)

}