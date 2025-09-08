import { useState } from "react";
import AnimatedScore from "../AnimatedScore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Cricket = ({ team1, team2, onUpdateScore }) => {
  const [overs1, setOvers1] = useState({ overs: 0, balls: 0 });
  const [overs2, setOvers2] = useState({ overs: 0, balls: 0 });

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <AnimatedScore score={team1.score} teamName={team1.name} color="blue"/>
        <Card className="bg-slate-800 border-slate-600 mt-3">
          <CardContent className="text-center">
            Overs: {overs1.overs}.{overs1.balls}
            <div className="flex gap-2 justify-center mt-2">
              <Button size="sm" onClick={() => setOvers1(prev => ({ ...prev, balls: prev.balls < 5 ? prev.balls + 1 : 0, overs: prev.balls === 5 ? prev.overs + 1 : prev.overs }))}>+Ball</Button>
              <Button size="sm" variant="outline" onClick={() => setOvers1({ overs:0, balls:0 })}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <AnimatedScore score={team2.score} teamName={team2.name} color="red"/>
        <Card className="bg-slate-800 border-slate-600 mt-3">
          <CardContent className="text-center">
            Overs: {overs2.overs}.{overs2.balls}
            <div className="flex gap-2 justify-center mt-2">
              <Button size="sm" onClick={() => setOvers2(prev => ({ ...prev, balls: prev.balls < 5 ? prev.balls + 1 : 0, overs: prev.balls === 5 ? prev.overs + 1 : prev.overs }))}>+Ball</Button>
              <Button size="sm" variant="outline" onClick={() => setOvers2({ overs:0, balls:0 })}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cricket;
