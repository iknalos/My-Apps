import ScoreEntryDialog from '../ScoreEntryDialog';

export default function ScoreEntryDialogExample() {
  return (
    <div className="p-6">
      <ScoreEntryDialog
        team1Player1="Sarah Johnson"
        team1Player2="Mike Chen"
        team2Player1="Emma Davis"
        team2Player2="Tom Wilson"
      />
    </div>
  );
}
