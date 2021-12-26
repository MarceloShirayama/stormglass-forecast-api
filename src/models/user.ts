import mongoose, { Document, Model } from 'mongoose'

export interface User {
  _id?: string
  name: string
  email: string
  password: string
}

interface UserModel extends Omit<User, '_id'>, Document {}

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
    password: { type: String, required: true }
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

// eslint-disable-next-line no-redeclare
export const User: Model<UserModel> = mongoose.model('User', schema)

export enum CUSTOM_VALIDATION {
  // eslint-disable-next-line no-unused-vars
  DUPLICATED = 'DUPLICATED'
}

schema.path('email').validate(
  async (email: string): Promise<boolean> => {
    const emailCount = await mongoose.models.User.countDocuments({ email })
    return !emailCount
  },
  'Email already in use',
  CUSTOM_VALIDATION.DUPLICATED
)

// schema.pre<UserModel>('save', async function (next): Promise<void> {
//   if (!this.password || !this.isModified('password')) {
//     next()
//     return
//   }
//   try {
//     // const hashedPassword = await AuthService.hashPassword(this.password)
//     this.password = await bcrypt.hash(this.password, 10)
//   } catch (err) {
//     console.error(`Error hashing the password for the user ${this.name}`, err)
//   }
// })
