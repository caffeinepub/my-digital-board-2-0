import Map "mo:core/Map";
import Text "mo:core/Text";
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

  var currentSavedState : ?BoardState = null;

  public shared ({ caller }) func setBoardState(state : BoardState) : async () {
    currentSavedState := ?state;
  };

  public query ({ caller }) func getBoardState(_userId : Text) : async BoardState {
    switch (currentSavedState) {
      case (?state) { state };
      case (null) {
        {
          staffCards = [
            {
              id = 0;
              title = "Staff Tasks";
              description = "Complete staff onboarding";
              position = (0, 0);
            },
          ];
          courseCards = [
            {
              id = 1;
              title = "Course 1";
              description = "Revise course curriculum";
              position = (1, 0);
            },
          ];
        };
      };
    };
  };

  public query ({ caller }) func getAllBoardStates() : async [(Text, BoardState)] {
    boardStates.entries().toArray();
  };
};
