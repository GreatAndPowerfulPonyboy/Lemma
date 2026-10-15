# Scheduling

Every point has its own schedule in SpacedRepetition. Topics have no schedule: a topic is due when any point in it is due.

A new point is [enrolled](reaction:scheduling.starting.ScheduleNewCue) as soon as it is created, so it is due at once, and a deleted point's schedule is [dropped](reaction:scheduling.starting.UnscheduleDeleted) with it.

When a recall check closes, each point it left out [lapses](reaction:scheduling.results.LapseOmitted): it comes back the next day, and its later gaps grow more slowly. Each point it mentioned is [advanced by the check's credit](reaction:scheduling.results.AdvanceMentioned). A check nobody rated has credit 0, which keeps the point's interval the same and moves its next review that far ahead. So covering a point takes it out of the queue, but the browser's rough match never lengthens an interval on its own.

Points created before scheduling existed have no schedule. The reactions that need one check for it first, so those points are simply never due.
