import { Beach, BeachPosition } from '@src/models/beach'
import { Rating } from '../rating'

const beachFake: Beach = {
  lat: -33.792726,
  lng: 151.289824,
  name: 'Manly',
  position: BeachPosition.E,
  user: 'fake-user-id'
}
let defaultRating: Rating

describe('Rating Service', () => {
  beforeEach(() => {
    defaultRating = new Rating(beachFake)
  })
  describe('Calculate rating for a given point', () => {
    // TODO: Implement tests
  })

  describe('Calculate rating based on wind and wave positions', () => {
    let windAndWaveBasedClassification: (
      beach: Beach,
      windPosition: BeachPosition
    ) => number

    beforeEach(() => {
      windAndWaveBasedClassification = (
        beach: Beach,
        windPosition: BeachPosition
      ): number => {
        return defaultRating.getRatingBasedOnWindAndWavePositions(
          beach.position,
          windPosition
        )
      }
    })
    it('Should get rating 1 for a beach with onshore winds', () => {
      const windFake = { position: BeachPosition.E }
      const rating = windAndWaveBasedClassification(
        beachFake,
        windFake.position
      )

      expect(rating).toBe(1)
    })

    it('Should get rating 3 for a beach with cross winds', () => {
      const windFake = { position: BeachPosition.S }
      const rating = windAndWaveBasedClassification(
        beachFake,
        windFake.position
      )

      expect(rating).toBe(3)
    })

    it('Should get rating 3 for a beach with offshore winds', () => {
      const windFake = { position: BeachPosition.W }
      const rating = windAndWaveBasedClassification(
        beachFake,
        windFake.position
      )

      expect(rating).toBe(5)
    })
  })

  describe('Get rating based on swell period', () => {
    it('Should get a rating of 1 for a period of less than or equal to 6 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(5)

      expect(rating).toBe(1)
    })

    it('Should get a rating of 2 for a period longer than 5 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(9)

      expect(rating).toBe(2)
    })

    it('Should get a rating of 4 for a period longer than 9 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(12)

      expect(rating).toBe(4)
    })

    it('Should get a rating of 5 for a period longer than 14 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(16)

      expect(rating).toBe(5)
    })
  })

  describe('Get rating based on swell height', () => {
    it('Should get rating 1 for less than ankle to knee high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.19)

      expect(rating).toBe(1)
    })

    it('Should get rating 2 for an ankle to knee high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.6)

      expect(rating).toBe(2)
    })

    it('Should get rating 3 for an knee to waist high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(1.3)

      expect(rating).toBe(3)
    })

    it('Should get rating 4 for waist high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(1.5)

      expect(rating).toBe(4)
    })

    it('Should get rating 5 for overhead swell', () => {
      const rating = defaultRating.getRatingForSwellSize(2.5)

      expect(rating).toBe(5)
    })
  })
})
