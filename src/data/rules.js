// ============================================================================
//  Official tournament rules, as supplied by the Organizing Committee.
//  Content only — the Rules page renders it. Lists nest via `list`; a `note`
//  renders as a sub-paragraph under an item.
// ============================================================================

export const PREAMBLE =
  `Founded in 2008, the Virginia Legend Cricket Club (VLCC) hosts this 15th Annual Cricket Tournament to enhance the prestige of the sport, improve playing excellence, and foster the spirit of sportsmanship among all cricketers. We consider it our duty to organize matches to foster community, excellence, and support for our fellow enthusiasts.`

export const RULES_SECTIONS = [
  {
    title: 'Tournament Format',
    blocks: [
      { list: { style: 'lower-alpha', items: [
        `16 teams shall participate in this year's tournament.`,
        { text: `First Round`, list: { style: 'lower-roman', items: [
          `16 teams will be grouped four (4) each into Group A, Group B, Group C, and Group D. Each team will play three matches in its respective group.`,
          `The top two (2) ranked teams from each group will qualify for the second round.`,
          `Teams will be ranked based on the number of points (Win = 2 points).`,
          { text: `If two or more teams are tied on points, the following tie-breakers shall be used:`, list: { style: 'lower-alpha', items: [
            `Net Run-Rate (Run Rate For – Run Rate Against). If a side is all-out, the full 5 overs will be used in the calculation.`,
            `If still tied, Average Runs Scored Per Wicket will be used.`,
          ] } },
          `Preliminary round games will consist of five (5) overs with six (6) balls per over. Each bowler is limited to one (1) over.`,
          `If a game is tied, the winner will be determined by a Super Over. The ICC Super Over rules shall apply.`,
          { text: `If the Super Over is tied, the team with the most boundaries (4s and 6s) in the match (including the Super Over) shall be the winner. If still tied, the team with the most boundaries excluding the Super Over shall be the winner.`,
            note: `Super Over data will not be counted toward Net Run-Rate or ARPW calculations.` },
        ] } },
        { text: `Second Round`, list: { style: 'lower-roman', items: [
          `The second round will consist of the "Super Eight" teams based on rankings.`,
          `The second round shall consist of the Quarter Finals: 1st vs 8th, 2nd vs 7th, 3rd vs 6th, and 4th vs 5th.`,
          `Winners will advance to the third round (Semi-Finals).`,
        ] } },
        { text: `Third Round / Semi-Finals`,
          note: `The third round will consist of winners of the second round on a knockout basis. The winner of QF 1 plays the winner of QF 4; the winner of QF 2 plays the winner of QF 3. Winners of the semi-finals will advance to the final match.` },
        { text: `Awards and Trophies`, list: { style: 'lower-roman', items: [
          `The winning team will receive a $1,000 cash prize, the Championship Challenge Trophy, and individual trophies for 8 registered players.`,
          `The runners-up will receive a $500 cash prize, a trophy, and individual trophies for 8 registered players.`,
          `Awards will include: 'Best Batsman,' 'Best Bowler,' and 'Most Valuable Player' (determined by Semi-Final and Final performances).`,
          `All trophies will be managed by a 3-member panel appointed by the organizers.`,
        ] } },
      ] } },
    ],
  },
  {
    title: 'The Spirit of Cricket',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `All participants are expected to observe the spirit of sportsmanship. Unsportsmanlike conduct results in disqualification from the tournament.`,
      `Players must obey the decisions of umpires and organizers.`,
      `Multiple disruptions of play by supporters will lead to the respective team's disqualification.`,
    ] } }],
  },
  {
    title: 'Teams',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `Registration is first-come, first-served. The VLCC reserves the right to deny entry.`,
      `All teams must report to the Tournament Marshal by 8:45 AM.`,
      `Each team may register 8 players; 6 must be selected and reported to scorers before each game. Once the game begins, no roster changes are allowed.`,
      `Substitutions are allowed only for in-match injuries; however, substitutes cannot bat or bowl.`,
    ] } }],
  },
  {
    title: 'Tournament Proceedings',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `The first match begins at 9:00 AM.`,
      `The toss will be held 15 minutes before the scheduled start.`,
      `Teams not ready at the start time will forfeit the game with full points awarded to the opponent. This is strictly enforced with no exceptions.`,
    ] } }],
  },
  {
    title: 'The Field',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `The pitch shall be 19 yards (57 feet) long.`,
      `The boundary line shall be 33 yards from the pitch, or as the ground allows.`,
    ] } }],
  },
  {
    title: 'Batting',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `LBW is not in effect. Deliberate blocking of the wicket with the body will result in a warning, then dismissal.`,
      `Interference with a catch is grounds for dismissal per MCC rules.`,
      `A batsman may retire out and not return; if retired due to injury, they may resume as the last man.`,
      `Runners are not allowed.`,
    ] } }],
  },
  {
    title: 'Bowling',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `MCC "No Ball" rules apply. One extra ball and one extra run are awarded per No Ball.`,
      `A Wide Ball is any delivery outside the return crease marks (3 feet from either side of the middle stump). One extra run and one extra ball are awarded.`,
      `Deliveries above head height are a No Ball.`,
      `Under-arm bowling is a No Ball.`,
      `Full tosses above waist height are a No Ball.`,
      `Balls bouncing before 10 yards or failing to reach the batsman are "Dead Ball."`,
      `Each bowler is limited to one (1) over.`,
      `Official match balls cannot be changed.`,
      `If a bowler is injured, the sixth team member must complete the over.`,
    ] } }],
  },
  {
    title: 'Fielding',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `A maximum of three (3) fielders may be placed on either side (on or off) of the field.`,
      `A catch carried over the boundary line (defined as the fielder touching the outside area while in possession of the ball) shall be scored as a six. The batsman shall not be out.`,
    ] } }],
  },
  {
    title: 'Umpires',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `VLCC will provide official main umpires for all the games.`,
      `Umpires have final decision-making power. Supporters may not challenge decisions; challenges are grounds for disqualification.`,
      `Semi-Finals and Finals will feature four boundary line officials.`,
      `ONLY THE TEAM CAPTAIN may discuss disputes with tournament management.`,
    ] } }],
  },
  {
    title: 'Other Rules',
    blocks: [{ list: { style: 'lower-alpha', items: [
      `Any items not covered shall be referred to the organizers, whose decision is final.`,
      { text: `MCC Laws of Cricket apply where not otherwise specified.`,
        link: { href: 'https://www.lords.org/mcc/about-the-laws-of-cricket', label: 'lords.org/mcc' } },
    ] } }],
  },
]

export const DISCLAIMER =
  `The tournament format, schedule, and rules are subject to change by the organizers at any time based on prevailing weather conditions, tournament-day situations, or other logistical requirements. The Organizing Committee reserves all rights to amend these regulations as necessary, and the decision of the Organizing Committee is final in all matters regarding the tournament.`
