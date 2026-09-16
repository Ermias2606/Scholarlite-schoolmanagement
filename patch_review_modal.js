import fs from 'fs';
let content = fs.readFileSync('src/components/ReviewMarksModal.tsx', 'utf8');

const mapStudentRowsOld = `    return {
      ...student,
      hasMarks,
      total,
      marks: res?.marks || {}
    };`;
    
const mapStudentRowsNew = `    return {
      ...student,
      hasMarks,
      total,
      marks: res?.marks || {},
      previousMarks: res?.previousMarks,
      editRemark: res?.editRemark,
      lastEditedAt: res?.lastEditedAt,
    };`;

content = content.replace(mapStudentRowsOld, mapStudentRowsNew);


const theadOld = `                    {subject.assessments.map(a => (
                      <th key={a.name} className="py-3 px-3 font-bold text-center">{a.name} ({a.maxScore})</th>
                    ))}
                    <th className="py-3 px-4 font-bold text-center bg-gray-100/50">Total ({maxPossibleScore})</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>`;

const theadNew = `                    {subject.assessments.map(a => (
                      <th key={a.name} className="py-3 px-3 font-bold text-center">{a.name} ({a.maxScore})</th>
                    ))}
                    <th className="py-3 px-4 font-bold text-center bg-gray-100/50">Total ({maxPossibleScore})</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-left min-w-[200px]">Edit Remark</th>`;

content = content.replace(theadOld, theadNew);


const rowMapOld = `                      {subject.assessments.map(a => (
                        <td key={a.name} className="py-2.5 px-3 text-center text-gray-700">
                          {row.hasMarks && row.marks[a.name] !== undefined ? row.marks[a.name] : '-'}
                        </td>
                      ))}
                      <td className="py-2.5 px-4 text-center font-black text-[#003366] bg-gray-50/50">
                        {row.hasMarks ? row.total : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.hasMarks ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Entered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </td>`;

const rowMapNew = `                      {subject.assessments.map(a => {
                        const currentMark = row.hasMarks && row.marks[a.name] !== undefined ? row.marks[a.name] : '-';
                        const prevMark = row.previousMarks && row.previousMarks[a.name] !== undefined ? row.previousMarks[a.name] : null;
                        const isEdited = prevMark !== null && prevMark !== currentMark;
                        return (
                          <td key={a.name} className="py-2.5 px-3 text-center text-gray-700">
                            <div className="flex flex-col items-center justify-center">
                              <span className={isEdited ? 'text-amber-700 font-bold' : ''}>{currentMark}</span>
                              {isEdited && (
                                <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded-sm mt-0.5 leading-tight" title={\`Changed from \${prevMark}\`}>
                                  was {prevMark}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-4 text-center font-black text-[#003366] bg-gray-50/50">
                        {row.hasMarks ? row.total : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.hasMarks ? (
                          row.editRemark ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                              <AlertTriangle className="w-3 h-3" /> Edited
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Entered
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-left text-xs text-gray-600 italic break-words whitespace-pre-wrap">
                        {row.editRemark || '-'}
                      </td>`;

content = content.replace(rowMapOld, rowMapNew);

fs.writeFileSync('src/components/ReviewMarksModal.tsx', content);
