import React, { useState } from 'react';
import { RaidResults } from '@/components/armies/RaidResults';
import type { GetRealmsQuery } from '@/generated/graphql';

type Prop = {
  event?: any;
};

export const RaidDetailsSideBar: React.FC<Prop> = (props) => {
  const event = props.event;
  const [selectedRealms, setSelectedRealms] = useState<
    GetRealmsQuery['realms']
  >([]);
  return (
    <div>
      {/* <p>Tx Hash: {combatData} </p> */}
      <RaidResults
        event={props.event}
        fromAttackRealmId={event.attackRealmId}
        tx={event.txHash}
      />
    </div>
  );
};