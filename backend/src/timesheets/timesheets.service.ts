import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type DailyTimesheetRow = {
  date: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  busId?: string | null;
  busCode?: string | null;
  inTime?: string | null;
  outTime?: string | null;
  workedMinutes: number;
  status: 'PRESENT' | 'ABSENT' | 'MISSING_OUT' | 'OUT_WITHOUT_IN';
};

@Injectable()
export class TimesheetsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDayRange(date?: string) {
    const now = new Date();
    const localIsoDate = (() => {
      const offset = now.getTimezoneOffset();
      return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
    })();

    const isoDate = date ?? localIsoDate;

    // Interpret the provided date as a local day, not UTC, to avoid shifting.
    const dayStart = new Date(`${isoDate}T00:00:00`);
    const dayEnd = new Date(`${isoDate}T23:59:59.999`);

    return { dayStart, dayEnd, isoDate };
  }

  async daily(args: { date?: string; projectId?: string; busId?: string }) {
    const { dayStart, dayEnd, isoDate } = this.parseDayRange(args.date);

    const allocations = await this.prisma.allocation.findMany({
      where: {
        isActive: true,
        startDate: { lte: dayEnd },
        OR: [{ endDate: null }, { endDate: { gte: dayStart } }],
        ...(args.projectId ? { projectId: args.projectId } : {}),
        ...(args.busId ? { busId: args.busId } : {}),
      },
      include: {
        employee: true,
        project: true,
        bus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (allocations.length === 0) return [];

    const employeeIds = Array.from(new Set(allocations.map((a) => a.employeeId)));
    const projectIds = Array.from(new Set(allocations.map((a) => a.projectId)));

    const punches = await this.prisma.attendancePunch.findMany({
      where: {
        employeeId: { in: employeeIds },
        projectId: { in: projectIds },
        punchedAt: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { punchedAt: 'asc' },
    });

    const groupKey = (employeeId: string, projectId: string) =>
      `${employeeId}::${projectId}`;
    const grouped = new Map<string, typeof punches>();
    for (const p of punches) {
      const key = groupKey(p.employeeId, p.projectId);
      const arr = grouped.get(key);
      if (arr) arr.push(p);
      else grouped.set(key, [p]);
    }

    const rows: DailyTimesheetRow[] = allocations.map((allocation) => {
      const key = groupKey(allocation.employeeId, allocation.projectId);
      const list = grouped.get(key) ?? [];
      const firstIn = list.find((p) => p.punchType === 'IN') ?? null;
      const lastOut =
        [...list].reverse().find((p) => p.punchType === 'OUT') ?? null;

      let workedMinutes = 0;
      let status: DailyTimesheetRow['status'] = 'ABSENT';

      if (firstIn && lastOut) {
        const diff = lastOut.punchedAt.getTime() - firstIn.punchedAt.getTime();
        workedMinutes = diff > 0 ? Math.round(diff / 60000) : 0;
        status = 'PRESENT';
      } else if (firstIn && !lastOut) {
        status = 'MISSING_OUT';
      } else if (!firstIn && lastOut) {
        status = 'OUT_WITHOUT_IN';
      }

      return {
        date: isoDate,
        employeeId: allocation.employeeId,
        employeeCode: allocation.employee.employeeCode,
        fullName: allocation.employee.fullName,
        projectId: allocation.projectId,
        projectCode: allocation.project.projectCode,
        projectName: allocation.project.projectName,
        busId: allocation.busId,
        busCode: allocation.bus?.busCode ?? null,
        inTime: firstIn ? firstIn.punchedAt.toISOString() : null,
        outTime: lastOut ? lastOut.punchedAt.toISOString() : null,
        workedMinutes,
        status,
      };
    });

    return rows.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
  }

  async dailyCsv(args: { date?: string; projectId?: string; busId?: string }) {
    const rows = await this.daily(args);
    const header =
      'date,employeeCode,fullName,projectCode,projectName,busCode,inTime,outTime,workedMinutes,status';
    const lines = rows.map((r) =>
      [
        r.date,
        escapeCsv(r.employeeCode),
        escapeCsv(r.fullName),
        escapeCsv(r.projectCode),
        escapeCsv(r.projectName),
        escapeCsv(r.busCode ?? ''),
        escapeCsv(r.inTime ?? ''),
        escapeCsv(r.outTime ?? ''),
        String(r.workedMinutes),
        r.status,
      ].join(','),
    );
    return [header, ...lines].join('\n');
  }
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
