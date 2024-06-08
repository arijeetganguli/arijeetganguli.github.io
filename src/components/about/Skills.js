const programming = [
  { id: 1, name: "C#", value: 95 },
  { id: 2, name: ".NET", value: 85 },
  { id: 3, name: "JavaScript", value: 80 },
  { id: 4, name: "Nodejs", value: 75 },
  { id: 5, name: "React", value: 50 },
  { id: 6, name: "Vue", value: 40 },
  { id: 7, name: "Python", value: 30 },
];
const databases = [
  { id: 6, name: "MSSQL", value: 90 },
  { id: 7, name: "MySQL", value: 90 },
  { id: 10, name: "AWS DocumentDB", value: 85 },
  { id: 9, name: "MongoDB", value: 80 },
  { id: 12, name: "TrinoDB", value: 75 },
  { id: 8, name: "PostgreSQL", value: 50 },
  { id: 11, name: "RavenDB", value: 40 },
];
const Skills = () => {
  return (
    <div className="sanari_tm_progressbox w-full h-auto clear-both float-left bg-white pt-[93px] pr-[0px] pb-[100px] pl-[0px]">
      <div className="container">
        <div className="in w-full h-auto clear-both float-left flex">
          <div className="left w-1/2 pr-[50px]">
            <div className="sanari_section_title w-full h-auto clear-both float-left mb-[40px]">
              <h3 className="text-[20px] font-bold">Programming Skills</h3>
            </div>
            <div className="sanari_progress">
              {programming.map((skill) => (
                <div className="progress_inner" key={skill.id}>
                  <span>
                    <span className="label">{skill.name}</span>
                    <span className="number">{skill.value}%</span>
                  </span>
                  <div className="background">
                    <div className="bar">
                      <div
                        className="bar_in"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="right w-1/2 pl-[50px]">
            <div className="sanari_section_title w-full h-auto clear-both float-left mb-[40px]">
              <h3 className="text-[20px] font-bold">Databases</h3>
            </div>
            <div className="sanari_progress">
              {databases.map((skill) => (
                <div className="progress_inner" key={skill.id}>
                  <span>
                    <span className="label">{skill.name}</span>
                    <span className="number">{skill.value}%</span>
                  </span>
                  <div className="background">
                    <div className="bar">
                      <div
                        className="bar_in"
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Skills;
