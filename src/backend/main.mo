import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type PlayerScore = {
    name : Text;
    bestDistance : Float;
    carIndex : Nat;
  };

  module PlayerScore {
    public func compareByBestDistance(a : PlayerScore, b : PlayerScore) : Order.Order {
      if (a.bestDistance < b.bestDistance) { #less }
      else if (a.bestDistance > b.bestDistance) {
        #greater;
      } else { Text.compare(a.name, b.name) };
    };
  };

  let scoreStore = Map.empty<Text, PlayerScore>();

  public shared ({ caller }) func submitScore(name : Text, distance : Float, carIndex : Nat) : async () {
    let newScore = { name; bestDistance = distance; carIndex };
    switch (scoreStore.get(name)) {
      case (null) {
        scoreStore.add(name, newScore);
      };
      case (?existingScore) {
        if (distance > existingScore.bestDistance) {
          scoreStore.add(name, newScore);
        };
      };
    };
  };

  public query ({ caller }) func getTopScores(limit : Nat) : async [PlayerScore] {
    let allScores = scoreStore.values().toArray().sort(PlayerScore.compareByBestDistance);
    let count = if (allScores.size() < limit) { allScores.size() } else { limit };
    Array.tabulate<PlayerScore>(count, func(i) { allScores[i] });
  };

  public query ({ caller }) func getPlayersCar(playerName : Text) : async Nat {
    switch (scoreStore.get(playerName)) {
      case (null) { Runtime.trap("Player not found!") };
      case (?player) { player.carIndex };
    };
  };
};
