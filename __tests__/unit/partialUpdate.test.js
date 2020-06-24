const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {

      const { query, values } = sqlForPartialUpdate(
        "companies",
        { num_employees: 1000 },
        "handle",
        "appleinc"
      );

      expect(query)
        .toEqual("UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *");
      expect(values)
        .toEqual([1000, "appleinc"]);
    });
});
