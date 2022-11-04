import { graphql } from '@/gql/gql';

export const RealmArmiesFragment = graphql(`
  fragment RealmArmies on Realm {
    ownArmies {
      armyId
      realmId
      xp
      destinationRealmId
      destinationArrivalTime
      # // ArmyData
      armyPacked
      lastAttacked
      xp
      level
      callSign

      # Battallion stats
      lightCavalryQty
      lightCavalryHealth
      heavyCavalryQty
      heavyCavalryHealth
      archerQty
      archerHealth
      longbowQty
      longbowHealth
      mageQty
      mageHealth
      arcanistQty
      arcanistHealth
      lightInfantryQty
      lightInfantryHealth
      heavyInfantryQty
      heavyInfantryHealth
    }
  }
`);
