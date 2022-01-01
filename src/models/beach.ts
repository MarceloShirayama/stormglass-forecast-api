import mongoose, { Document, Model, Schema } from 'mongoose'
import { User } from './user'

export enum GeoPosition {
  /* eslint-disable no-unused-vars */
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
  /* eslint-enable no-unused-vars */
}

export interface Beach {
  _id?: string
  lat: number
  lng: number
  name: string
  position: GeoPosition
  userId: typeof User.prototype.id
}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      }
    }
  }
)

interface BeachModel extends Omit<Beach, '_id'>, Document {}

// eslint-disable-next-line no-redeclare
export const Beach: Model<BeachModel> = mongoose.model('Beach', schema)
