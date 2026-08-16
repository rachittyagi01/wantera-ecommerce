import { Response } from "express"
import { Address } from "../models/Address"
import { AuthRequest } from "../middleware/authMiddleware"

export async function getAddresses(req: AuthRequest, res: Response) {
  try {
    const addresses = await Address.find({ user: req.user!.userId }).sort({ isDefault: -1, createdAt: -1 })
    res.json({ addresses })
  } catch (error) {
    console.error("Get addresses error:", error)
    res.status(500).json({ message: "Failed to fetch addresses" })
  }
}

export async function createAddress(req: AuthRequest, res: Response) {
  try {
    const { name, phone, addressLine, city, state, postalCode, country, addressType, isDefault } = req.body

    if (!name || !phone || !addressLine || !city || !state || !postalCode) {
      return res.status(400).json({ message: "Missing required address fields" })
    }

    // If this new address is marked default, unset default on all others first
    if (isDefault) {
      await Address.updateMany({ user: req.user!.userId }, { isDefault: false })
    }

    const address = await Address.create({
      user: req.user!.userId,
      name,
      phone,
      addressLine,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault: isDefault || false,
    })

    res.status(201).json({ message: "Address added", address })
  } catch (error) {
    console.error("Create address error:", error)
    res.status(500).json({ message: "Failed to create address" })
  }
}

export async function updateAddress(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user!.userId }, { isDefault: false })
    }

    // Match both _id AND user — ensures a user can never edit someone else's address
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user!.userId },
      req.body,
      { new: true }
    )

    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    res.json({ message: "Address updated", address })
  } catch (error) {
    console.error("Update address error:", error)
    res.status(500).json({ message: "Failed to update address" })
  }
}

export async function deleteAddress(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params

    const address = await Address.findOneAndDelete({ _id: id, user: req.user!.userId })
    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    res.json({ message: "Address deleted" })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({ message: "Failed to delete address" })
  }
}