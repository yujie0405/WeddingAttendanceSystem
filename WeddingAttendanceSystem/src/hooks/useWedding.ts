import { useContext } from "react";
import { WeddingContext } from "../providers/WeddingProvider";
export function useWedding() {
  const value = useContext(WeddingContext);
  if (!value) throw new Error("WeddingProvider is missing");
  return value;
}
