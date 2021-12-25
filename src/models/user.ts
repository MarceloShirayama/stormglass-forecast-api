import mongoose, { Document, Model } from 'mongoose'

export interface User {
  _id?: string
  name: string
  email: string
  password: string
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true, // Uma pegadinha comum para iniciantes é que a unique opção por esquemas não é um validador. É um auxiliar conveniente para construir índices exclusivos do MongoDB . Veja o FAQ para mais informações.
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: [5, 'Email must be at least 5 characters'],
      maxlength: [18, 'Email must be less than 18 characters']
    }
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

interface UserModel extends Omit<User, '_id'>, Document {}

// eslint-disable-next-line no-redeclare
export const User: Model<UserModel> = mongoose.model('User', schema)
