import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type Card = {
    id : Nat;
    title : Text;
    description : Text;
    position : (Int, Int);
  };

  type BoardState = {
    staffCards : [Card];
    courseCards : [Card];
  };

  let boardStates = Map.empty<Text, BoardState>();

  public query ({ caller }) func getBoardState(userId : Text) : async BoardState {
    switch (boardStates.get(userId)) {
      case (null) { Runtime.trap("Board state not found for user: " # userId) };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func updateBoardState(userId : Text, newState : BoardState) : async () {
    boardStates.add(userId, newState);
  };

  public query ({ caller }) func getAllBoardStates() : async [(Text, BoardState)] {
    boardStates.entries().toArray();
  };
};
