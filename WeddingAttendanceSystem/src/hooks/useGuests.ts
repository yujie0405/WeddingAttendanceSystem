import { useWedding } from "./useWedding";
export function useGuests() {
  const { state, actions } = useWedding();
  return {
    guests: state.guests,
    toggleCheckIn: actions.toggleCheckIn,
    checkInFamily: actions.checkInFamily,
    addGuest: actions.addGuest,
    editGuest: actions.editGuest,
  };
}
